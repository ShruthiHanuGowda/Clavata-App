import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking, Platform,
  Share,
  Alert
} from 'react-native';
import RNFS from 'react-native-fs';
import { Header, Tab } from '@rneui/base';
import axios from 'axios';
import { navigateBack } from '../../../Navigation/NavigationFunctions';
import { DText } from '../../../Componants/DText';
import images from '../../../Theme/images';
import LinearGradient from 'react-native-linear-gradient';
import { fontsFamily } from '../../../Theme';
import { useState } from 'react';
import { formatQuantityMWh } from '../../../utils';
import { useCompleteNft } from '../../../hooks/useCompleteNft';
import { NftLocation } from '../../../types/types';
import SellModal from '../../../Componants/MarketPlace/BuySellModal/SellModal';
import useApi from '../../../hooks/useApi';
import { API_NFT_URL } from '../../../constants';
import useNftActivity from '../../../hooks/useNftActivity';
import { OffsetModal } from '../../../Componants/MarketPlace/OffsetModal';
import { useAuth } from '../../../../screens/Provider/authProvider';
import { useMagic } from '../../../../screens/Provider/MagicProvider';
import { getBlockExploreLink } from '../../../utils/explorer';
import { useOffsetNft } from '../../../hooks/useOffsetNft';

const width = Dimensions.get('window').width;

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.actionContainer} onPress={onPress}>
    <View style={styles.actionIconWrapper}>
      <Image source={icon} style={styles.actionIcon} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const NFTHeader = ({ name, quantity }) => (
  <View style={styles.nftHeaderContainer}>
    <ImageBackground
      source={images.rectangle}
      resizeMode="cover"
      imageStyle={{ borderRadius: 7 }}
      style={styles.nftImageBackground}>
      <Image source={images.rectangleDot} style={styles.nftOverlayImage} />
      <DText fontStyle="fontBold" style={styles.portfolio}>
        NFT Details
      </DText>
      <DText
        fontStyle="fontBold"
        style={styles.totalAmount}
        textProps={{ numberOfLines: 1, ellipsizeMode: 'tail' }}>
        {name}
      </DText>
      <DText fontStyle="fontBold" style={styles.amount}>
        {quantity}
      </DText>
    </ImageBackground>
  </View>
);

const WalletNFTDetailsScreen = ({ route }) => {
  const { nft } = route.params;
  const { userDetails } = useAuth();
  const { magic_denergy } = useMagic();

  const [index, setIndex] = useState(0);
  const [clickedSellNft, setClickedSellNft] = useState<any>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [isOffsetModalVisible, setIsOffsetModalVisible] = useState(false);
  const [offsetVolume, setOffsetVolume] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(nft?.marketData?.quantity || 0);


  const account = userDetails?.userWallet as `0x${string}`;

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
  } = useOffsetNft(magic_denergy, account, userDetails?.walletAddress, setCurrentQuantity);

  const availableQuantity = getAvailableQuantity(nft?.marketData?.quantity || 0);

  const TAB_ITEMS = ['Details', 'Sellers', 'Activity'];

  const handleCollectibleClick = (location?: NftLocation) => {
    switch (location) {
      case NftLocation.WALLET:
        setClickedSellNft({ nft, location, variant: 'sell' });
        setIsSellModalVisible(true);
        break;
      case NftLocation.FORSALE:
        setClickedSellNft({ nft, location, variant: 'adjust' });
        setIsSellModalVisible(true);
        break;
      default:
        break;
    }
  };

  const {
    nft: combinedNft,
    loading: isLoading,
    refetch,
  } = useCompleteNft(`${nft?.collectionAddress}-${nft?.tokenId}`);


  const { data, isLoading: isCollectionLoading } = useApi<any>(
    `${API_NFT_URL}/nftMarketplace_getCollectionTokens?contractAddress=${nft?.collectionAddress}&tokenId=${nft?.tokenId}`,
    { method: 'GET' },
  );

  const handleOffsetSubmit = async (volume) => {
    const success = await executeOffset(volume, nft);
    if (!success) {
      return;
    }

  };

  const handleViewCertificate = () => {
    if (redemptionUrl) {
      Linking.openURL(redemptionUrl).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  const handleExplorer = () => {
    if (transactionHash) {
      const url = getBlockExploreLink(transactionHash, 'transaction');
      Linking.openURL(url).catch(err =>
        console.error('Failed to open URL:', err),
      );
    }
  };

  const onPressCertificateDownload = async () => {
    try {
      if (!pdfDownloadUrl) {
        return;
      }
      const timestamp = Math.floor(Date.now() / 1000);
      const url = pdfDownloadUrl;
      const fileName = `certificate_${timestamp}.pdf`;

      const filePath =
        Platform.OS === 'android'
          ? `${RNFS.DownloadDirectoryPath}/${fileName}`
          : `${RNFS.DocumentDirectoryPath}/${fileName}`;

      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        headers: {
          Accept: 'application/pdf',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        maxRedirects: 5,
        timeout: 30000,
      });

      const firstBytes = response.data.slice(0, 10);
      const startOfFile = Buffer.from(firstBytes).toString().substring(0, 5);

      if (startOfFile !== '%PDF-') {
        console.log(
          'Not a PDF file, received:',
          Buffer.from(response.data).toString().substring(0, 100),
        );
        throw new Error('Response is not a valid PDF');
      }

      await RNFS.writeFile(
        filePath,
        Buffer.from(response.data).toString('base64'),
        'base64',
      );

      const stats = await RNFS.stat(filePath);

      const shareUrl = Platform.OS === 'ios' ? filePath : `file://${filePath}`;
      Share.share({
        message: 'Here is your certificate:',
        url: shareUrl,
        title: 'Certificate Download Complete',
      });
    } catch (error) {
      Alert.alert(
        'Download Failed',
        'There was a problem downloading the certificate. Please try again later.',
      );
    }
  };

  const handleOffsetModalClose = () => {
    setIsOffsetModalVisible(false);
    setOffsetVolume('');
    resetOffsetState();
  };

  const hasTokenData = combinedNft?.tokenId && combinedNft?.collectionAddress;

  const {
    activity,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useNftActivity(
    hasTokenData ? combinedNft.tokenId : '',
    hasTokenData ? combinedNft.collectionAddress : '',
  );

  const owners = combinedNft?.marketData?.activeAsks || [];

  if (isLoading || isCollectionLoading || !combinedNft) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#81c8c3" />
        <Text style={styles.loadingText}>Fetching NFT Details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{ borderBottomWidth: 0 }}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={styles.iconContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <DText fontStyle="fontBold" style={styles.headerTitle}>
              NFTs
            </DText>
          </View>
        }
      />
      <ScrollView>
        <View style={{ marginTop: 5 }}>
          <LinearGradient
            colors={['#FFFFFF', '#dcf2f1', '#FFFFFF']}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            useAngle={true}
            angle={330}
            locations={[0, 0, 0.25]}>
            <View style={{ paddingTop: 10, paddingBottom: 30 }}>
              <NFTHeader
                name={nft?.name}
                quantity={formatQuantityMWh(
                  Number(currentQuantity),
                )}
              />
              <View style={styles.btnAlign}>
                <ActionButton
                  icon={images.swapcoin}
                  label={
                    nft.location === NftLocation.WALLET ? 'Sell' : 'Modify'
                  }
                  onPress={() => handleCollectibleClick(nft.location)}
                />
                <ActionButton
                  icon={images.sendIcon}
                  label="Send"
                  onPress={() => {
                    setClickedSellNft({
                      nft,
                      location: nft.location,
                      variant: 'transfer',
                    });
                    setIsSellModalVisible(true);
                  }}
                />
                <ActionButton
                  icon={images.buyIcon}
                  label="Offset"
                  onPress={() => setIsOffsetModalVisible(true)}
                />
              </View>
            </View>
          </LinearGradient>
          <Tab
            value={index}
            onChange={setIndex}
            variant="primary"
            indicatorStyle={{ backgroundColor: 'transparent' }}
            style={{ backgroundColor: 'transparent' }}>
            {TAB_ITEMS.map((tab, i) => (
              <Tab.Item
                key={i}
                containerStyle={active => ({
                  borderBottomColor: active ? '#009D94' : '#E1E1E1',
                  borderBottomWidth: active ? 2 : 1.4,
                  backgroundColor: 'transparent',
                })}
                title={tab}
                titleStyle={active => ({
                  color: active ? '#000' : '#989898',
                  fontFamily: active
                    ? fontsFamily.MulishExtraBold
                    : fontsFamily.MulishBold,
                  fontSize: 14,
                })}
              />
            ))}
          </Tab>
        </View>
        <View style={{ marginHorizontal: 25, marginTop: 20 }}>
          {index === 0 && (
            <View style={styles.detailsContainer}>
              {[
                [
                  'Collection Name',
                  `${data?.collectionDetails?.collectionName}`,
                ],
                ['Symbol', `${data?.collectionDetails?.symbol}`],
                ['Year', `${data?.collectionDetails?.year}`],
                ['Country', `${data?.collectionDetails?.country}`],
                [
                  'Contract Address',
                  `${data?.collectionDetails?.contractAddress}`,
                ],
                ['Owner Address', `${data?.collectionDetails?.ownerAddress}`],
                ['Type', `${data?.collectionDetails?.type}`],
                ['Token ID', `${data?.tokenId}`],
                [
                  'Metadata URL',
                  `${combinedNft?.marketData?.metadataUrl ?? '-'}`,
                ],
                [
                  'Trade Volume (USDC)',
                  `${combinedNft?.marketData?.tradeVolumeUSDC ?? '-'}`,
                ],
                [
                  'Latest Traded Price (USDC)',
                  `${combinedNft?.marketData?.latestTradedPriceInUSDC ?? '-'}`,
                ],
                [
                  'Total Trades',
                  `${combinedNft?.marketData?.totalTrades ?? 0}`,
                ],
                ['Total Listed', `${nft?.marketData?.totalListed ?? 0}`],
              ].map(([title, value], idx) => (
                <View key={idx} style={styles.detailRow}>
                  <Text
                    style={styles.detailTitle}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {title}
                  </Text>
                  <Text
                    style={styles.detailValue}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {index === 1 && (
            <>
              {owners.length > 0 ? (
                owners.map((item, idx) => (
                  <View key={idx} style={styles.sellerContainer}>
                    <View style={styles.sellerRow}>
                      <Text style={styles.sellerLabel}>Price:</Text>
                      <Text style={styles.sellerValue}>
                        $ {item.askPrice} Per MWh
                      </Text>
                    </View>
                    <View style={styles.sellerRow}>
                      <Text style={styles.sellerLabel}>Qty:</Text>
                      <Text style={styles.sellerValue}>
                        {formatQuantityMWh(Number(item.amount ?? 0))}
                      </Text>
                    </View>
                    <View style={styles.sellerRow}>
                      <Text style={styles.sellerLabel}>Seller:</Text>
                      <Text
                        style={styles.sellerValue}
                        numberOfLines={1}
                        ellipsizeMode="middle">
                        {item.seller.id}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No sellers found.</Text>
              )}
            </>
          )}
          {index === 2 && (
            <View>
              {activity && activity.length > 0 ? (
                activity.map((item, idx) => (
                  <View key={idx} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <Text style={styles.activityEvent}>
                        {item.marketEvent}
                      </Text>
                      <Text style={styles.activityPrice}>${item.price}</Text>
                    </View>

                    <View style={styles.activityDetailRow}>
                      <Text style={styles.activityLabel}>From</Text>
                      <Text
                        style={styles.activityValue}
                        numberOfLines={1}
                        ellipsizeMode="middle">
                        {item.seller ?? '-'}
                      </Text>
                    </View>

                    <View style={styles.activityDetailRow}>
                      <Text style={styles.activityLabel}>To</Text>
                      <Text
                        style={styles.activityValue}
                        numberOfLines={1}
                        ellipsizeMode="middle">
                        {item.buyer ?? '-'}
                      </Text>
                    </View>

                    <View style={styles.activityDetailRow}>
                      <Text style={styles.activityLabel}>Date</Text>
                      <Text style={styles.activityValue}>
                        {new Date(
                          Number(item.timestamp) * 1000,
                        ).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No activity available.</Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>
      <SellModal
        visible={isSellModalVisible}
        onClose={() => {
          setIsSellModalVisible(false);
          setClickedSellNft(null);
        }}
        variant={clickedSellNft?.variant}
        nftToSell={clickedSellNft?.nft || nft}
        onSuccessSale={() => {
          setIsSellModalVisible(false);
          setClickedSellNft(null);
          refetch();
          refetchActivity();
        }}
      />

      <OffsetModal
        visible={isOffsetModalVisible}
        onClose={handleOffsetModalClose}
        onSubmit={handleOffsetSubmit}
        value={offsetVolume}
        setValue={setOffsetVolume}
        isLoadingOffset={isLoadingOffset}
        redemptionUrl={redemptionUrl}
        offsetSuccess={offsetSuccess}
        availableQuantity={availableQuantity}
        onValidateVolume={validateOffsetVolume}
        handleExplorer={handleExplorer}
        handleViewCertificate={handleViewCertificate}
        handleDownloadCertificate={onPressCertificateDownload}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  iconContainer: {
    position: 'relative',
    marginRight: 10,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  portfolio: {
    top: 10,
    color: '#FFFF',
    fontSize: 12,
    lineHeight: 20,
    position: 'absolute',
    marginTop: 10,
  },
  totalAmount: {
    color: '#FFFF',
    fontSize: 30,
    position: 'absolute',
  },
  amount: {
    color: '#FFFF',
    fontSize: 20,
    position: 'absolute',
    bottom: 50,
  },
  btnAlign: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-around',
    width: width - 60,
    alignItems: 'center',
    marginHorizontal: 30,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconWrapper: {
    borderRadius: 30,
    backgroundColor: '#E0F0EF',
    padding: 18,
  },
  actionIcon: {
    width: 14,
    height: 14,
  },
  actionLabel: {
    marginVertical: 5,
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 12,
    color: '#00201B',
  },
  nftHeaderContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  nftImageBackground: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    width: '100%',
  },
  nftOverlayImage: {
    alignSelf: 'flex-end',
    height: '100%',
    width: '38%',
  },
  detailsContainer: {
    margin: 5,
    padding: 15,
    borderWidth: 1,
    borderColor: '#009D94',
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailTitle: {
    flex: 1,
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#555',
    marginRight: 10,
  },

  detailValue: {
    flex: 1,
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 14,
    color: '#222',
    textAlign: 'right',
  },
  sellerContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F0FBFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D2EFEF',
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sellerLabel: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#444',
    flex: 1,
  },
  sellerValue: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 14,
    color: '#111',
    flex: 1,
    textAlign: 'right',
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0F0EF',
  },

  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  activityEvent: {
    fontFamily: fontsFamily.MulishExtraBold,
    fontSize: 16,
    color: '#00201B',
  },

  activityPrice: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 16,
    color: '#009D94',
  },

  activityDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  activityLabel: {
    fontFamily: fontsFamily.Mulish,
    fontSize: 13,
    color: '#666',
    width: 50,
  },

  activityValue: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 13,
    color: '#111',
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default WalletNFTDetailsScreen;
