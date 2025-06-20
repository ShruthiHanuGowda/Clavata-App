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
  Alert,
} from 'react-native';
import {Header, Tab} from '@rneui/base';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {DText} from '../../../Componants/DText';
import images from '../../../Theme/images';
import LinearGradient from 'react-native-linear-gradient';
import {fontsFamily} from '../../../Theme';
import {useEffect, useMemo, useState} from 'react';
import {formatQuantityMWh} from '../../../utils';
import {useCompleteNft} from '../../../hooks/useCompleteNft';
import {NftLocation, NftToken} from '../../../types/types';
import useApi from '../../../hooks/useApi';
import {API_NFT_URL, NFT_DEFAULT_IMAGE_URL} from '../../../constants';
import useNftActivity from '../../../hooks/useNftActivity';
import {useNavigation} from '@react-navigation/native';
import {BrowserProvider, Contract} from 'ethers';
import {useMagic} from '../../../../screens/Provider/MagicProvider';
import {ERC1155_ABI} from '../../../utils/Contracts';
import {useAuth} from '../../../../screens/Provider/authProvider';
import {SnackBarMessage} from '../../../utils/snackBar';
import {useKycCheck} from '../../../CustomHooks/GlobalKycProvider';
import {RefreshControl} from 'react-native-gesture-handler';

const width = Dimensions.get('window').width;

interface ActionButtonProps {
  icon: any;
  label: string;
  onPress: () => void;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  energy_type_image?: string;
  country_image?: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

const ActionButton = ({icon, label, onPress}: ActionButtonProps) => (
  <TouchableOpacity style={styles.actionContainer} onPress={onPress}>
    <View style={styles.actionIconWrapper}>
      <Image source={icon} style={styles.actionIcon} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

interface NFTHeaderProps {
  name: string;
  quantity: string;
  imageUrl: string | null;
  metadata?: NFTMetadata | null;
}

const NFTHeader = ({name, quantity, imageUrl, metadata}: NFTHeaderProps) => (
  <View style={styles.nftHeaderContainer}>
    {/* NFT Image Card */}
    <View style={styles.nftImageCard}>
      <View style={styles.nftImageContainer}>
        {metadata?.image || imageUrl ? (
          <Image
            source={{uri: metadata?.image || imageUrl}}
            style={styles.nftSquareImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.nftPlaceholderImage}>
            <Image
              source={images.rectangleDot}
              style={styles.placeholderIcon}
            />
          </View>
        )}
      </View>
    </View>

    {/* NFT Info Card */}
    <View style={styles.nftInfoCard}>
      <View style={styles.nftInfoHeader}>
        <Text style={styles.nftDetailsLabel}>Certificate Details</Text>
      </View>
      <Text style={styles.nftName} numberOfLines={2} ellipsizeMode="tail">
        {metadata?.name || name}
      </Text>
      {metadata?.description && (
        <Text
          style={styles.nftDescription}
          numberOfLines={3}
          ellipsizeMode="tail">
          {metadata.description}
        </Text>
      )}
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityLabel}>Quantity</Text>
        <Text style={styles.quantityValue}>{quantity}</Text>
      </View>
    </View>
  </View>
);

const WalletNFTDetailsScreen = ({route}: any) => {
  const {nft, refresh} = route.params;
  const navigation = useNavigation();
  const {magic_denergy, setActiveNetwork} = useMagic();
  const {userDetails} = useAuth();

  const [index, setIndex] = useState(0);
  const [clickedSellNft, setClickedSellNft] = useState<any>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const [currentQuantity, setCurrentQuantity] = useState(
    nft?.marketData?.quantity,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const {checkKYC, isKycCompleted, isKycSkipped} = useKycCheck();

  const fetchNftMetadata = async () => {
    try {
      setMetadataLoading(true);
      setActiveNetwork('denergy');

      if (!nft?.collectionAddress || !nft?.tokenId) {
        console.error('Missing collection address or token ID in NFT data.');
        return;
      }

      const magicProvider = new BrowserProvider(
        magic_denergy.rpcProvider as any,
      );
      const signer = await magicProvider.getSigner();

      const collectionContract = new Contract(
        nft.collectionAddress,
        ERC1155_ABI,
        signer,
      );

      const metadataUri: string = await collectionContract.uri(nft.tokenId);

      if (metadataUri) {
        const response = await fetch(metadataUri);
        const metadata: NFTMetadata = await response.json();

        setNftMetadata(metadata);
      }
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
    } finally {
      setMetadataLoading(false);
    }
  };

  useEffect(() => {
    const fetchCurrentQuantity = async () => {
      try {
        setActiveNetwork('denergy');
        if (!nft?.collectionAddress) {
          console.error('Missing collection address in NFT data.');
          return;
        }

        const magicProvider = new BrowserProvider(
          magic_denergy.rpcProvider as any,
        );
        const signer = await magicProvider.getSigner();

        const collectionContract = new Contract(
          nft.collectionAddress,
          ERC1155_ABI,
          signer,
        );

        console.log(userDetails);

        const balance = await collectionContract.balanceOf(
          userDetails?.walletAddress,
          nft?.tokenId,
        );
        console.log(balance);

        setCurrentQuantity(balance);
      } catch (error) {
        console.error('Error fetching current quantity:', error);
      }
    };

    fetchCurrentQuantity();
    fetchNftMetadata(); // Fetch metadata when component mounts
  }, []);

  const TAB_ITEMS = ['Details', 'Sellers', 'Activity'];

  const handleCollectibleClick = (location?: NftLocation) => {
    switch (location) {
      case NftLocation.WALLET:
        navigation.navigate('SellNFT', {
          variant: 'sell',
          nftToSell: nft,
          refresh: () => {
            refetch();
            refresh();
            refetchActivity();
          },
        });
        break;
      case NftLocation.FORSALE:
        navigation.navigate('SellNFT', {
          variant: 'adjust',
          nftToSell: nft,
          refresh: () => {
            refetch();
            refresh();
            refetchActivity();
          },
        });
        break;
      default:
        break;
    }
  };

  const handleOffersClick = async () => {
    if (isKycCompleted) {
      navigation.navigate('OffsetScreen', {nft});
    } else {
      await checkKYC({
        onSuccess: () => {
          navigation.navigate('OffsetScreen', {nft});
        },
        onSkip: () => {
          SnackBarMessage(
            'Please complete your kyc to access this feature',
            'error',
          );
        },
        onError: error => {
          SnackBarMessage(
            'Please complete your kyc to access this feature',
            'error',
          );
        },
        showAlerts: false,
      });
    }
  };

  const handleSendNft = (nftToken: NftToken, variant: string) => {
    navigation.navigate('SellNFT', {
      variant: variant,
      nftToSell: nftToken,
      refresh: () => {
        Alert.alert('NFT Sent');
        refetch();
        refetchActivity();
      },
    });
  };

  const {
    nft: combinedNft,
    loading: isLoading,
    refetch,
  } = useCompleteNft(`${nft?.collectionAddress}-${nft?.tokenId}`);

  const {data, isLoading: isCollectionLoading} = useApi<any>(
    `${API_NFT_URL}/nftMarketplace_getCollectionTokens?contractAddress=${nft?.collectionAddress}&tokenId=${nft?.tokenId}`,
    {method: 'GET'},
  );

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

  const formattedQty = useMemo(
    () => formatQuantityMWh(Number(currentQuantity ?? 0)),
    [currentQuantity],
  );

  const owners = combinedNft?.marketData?.activeAsks || [];

  // Helper function to get attribute value
  const getAttributeValue = (traitType: string): string => {
    if (!nftMetadata?.attributes) return '-';
    const attribute = nftMetadata.attributes.find(
      attr => attr.trait_type === traitType,
    );
    return attribute ? String(attribute.value) : '-';
  };

  if (isLoading || isCollectionLoading || !combinedNft) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#009D94" />
        <Text style={styles.loadingText}>Fetching NFT Details...</Text>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    refetchActivity();
    fetchNftMetadata(); // Refetch metadata on refresh
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={styles.headerContainer}
        leftComponent={
          <TouchableOpacity
            onPress={() => navigateBack()}
            style={styles.backButton}>
            <Image source={images.back} style={styles.backIcon} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={styles.nameContainer}>
            <Text style={styles.headerTitle}>Certificate</Text>
          </View>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={['#F8FFFE', '#E8F8F7', '#F8FFFE']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.headerSection}>
          <NFTHeader
            name={nft?.name}
            quantity={formattedQty}
            imageUrl={
              data?.collectionDetails?.energy_type_image ||
              NFT_DEFAULT_IMAGE_URL
            }
            metadata={nftMetadata}
          />

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            <ActionButton
              icon={images.swapcoin}
              label={nft.location === NftLocation.WALLET ? 'Sell' : 'Modify'}
              onPress={() => handleCollectibleClick(nft.location)}
            />
            <ActionButton
              icon={images.sendIcon}
              label="Send"
              onPress={() => handleSendNft(nft, 'transfer')}
            />
            <ActionButton
              icon={images.buyIcon}
              label="Offset"
              onPress={() => handleOffersClick()}
            />
          </View>
        </LinearGradient>

        {/* Tab Section */}
        <View style={styles.tabSection}>
          <Tab
            value={index}
            onChange={setIndex}
            variant="primary"
            indicatorStyle={styles.tabIndicator}
            style={styles.tabContainer}>
            {TAB_ITEMS.map((tab, i) => (
              <Tab.Item
                key={i}
                containerStyle={active => ({
                  borderBottomColor: active ? '#009D94' : '#E5E5E5',
                  borderBottomWidth: active ? 3 : 1,
                  backgroundColor: 'transparent',
                  paddingVertical: 1,
                })}
                title={tab}
                titleStyle={active => ({
                  color: active ? '#009D94' : '#6B7280',
                  fontFamily: active
                    ? fontsFamily.MulishExtraBold
                    : fontsFamily.MulishBold,
                  fontSize: 16,
                  fontWeight: active ? '800' : '600',
                })}
              />
            ))}
          </Tab>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {index === 0 && (
            <View style={styles.detailsContainer}>
              {/* Enhanced details with metadata */}
              {[
                // Collection data
                [
                  'Collection Name',
                  `${data?.collectionDetails?.collectionName || '-'}`,
                ],
                ['Symbol', `${data?.collectionDetails?.symbol || '-'}`],
                ['Token ID', `${data?.tokenId || '-'}`],
                [
                  'Contract Address',
                  `${data?.collectionDetails?.contractAddress || '-'}`,
                ],

                // Metadata attributes
                ['Energy Type', getAttributeValue('Energy Type')],
                ['Country', getAttributeValue('Country')],
                ['Facility Name', getAttributeValue('Facility Name')],
                ['Volume (MWh)', getAttributeValue('Volume (MWh)')],
                [
                  'Production Start Date',
                  getAttributeValue('Production Start Date'),
                ],
                [
                  'Production End Date',
                  getAttributeValue('Production End Date'),
                ],
                [
                  'Facility Commissioning Date',
                  getAttributeValue('Facility Commissioning Date'),
                ],
                ['Standard', getAttributeValue('Standard')],
                ['Year', getAttributeValue('Year')],
                ['Registry', getAttributeValue('Registry')],
                ['Fuel Code', getAttributeValue('Fuel code')],
                ['Coordinates', getAttributeValue('cordinates')],

                // Market data
                [
                  'Owner Address',
                  `${data?.collectionDetails?.ownerAddress || '-'}`,
                ],
                ['Type', `${data?.collectionDetails?.type || '-'}`],
                [
                  'Metadata URL',
                  `${combinedNft?.marketData?.metadataUrl || '-'}`,
                ],
                [
                  'Trade Volume (USDC)',
                  `${combinedNft?.marketData?.tradeVolumeUSDC || '-'}`,
                ],
                [
                  'Latest Traded Price (USDC)',
                  `${combinedNft?.marketData?.latestTradedPriceInUSDC || '-'}`,
                ],
                [
                  'Total Trades',
                  `${combinedNft?.marketData?.totalTrades || 0}`,
                ],
                ['Total Listed', `${nft?.marketData?.totalListed || 0}`],
              ].map(([title, value], idx) => (
                <View key={idx} style={styles.detailRow}>
                  <Text style={styles.detailTitle} numberOfLines={1}>
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

              {/* Additional Images Section */}
              {/* {(nftMetadata?.energy_type_image ||
                nftMetadata?.country_image) && (
                <View style={styles.additionalImagesContainer}>
                  <Text style={styles.additionalImagesTitle}>
                    Additional Images
                  </Text>
                  <View style={styles.additionalImagesRow}>
                    {nftMetadata?.energy_type_image && (
                      <View style={styles.additionalImageContainer}>
                        <Image
                          source={{uri: nftMetadata.energy_type_image}}
                          style={styles.additionalImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.additionalImageLabel}>
                          Energy Type
                        </Text>
                      </View>
                    )}
                    {nftMetadata?.country_image && (
                      <View style={styles.additionalImageContainer}>
                        <Image
                          source={{uri: nftMetadata.country_image}}
                          style={styles.additionalImage}
                          resizeMode="contain"
                        />
                        <Text style={styles.additionalImageLabel}>
                          Country Flag
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )} */}

              {/* External URL */}
              {/* {nftMetadata?.external_url && (
                <TouchableOpacity style={styles.externalUrlContainer}>
                  <Text style={styles.externalUrlText}>Visit External URL</Text>
                  <Text style={styles.externalUrl}>
                    {nftMetadata.external_url}
                  </Text>
                </TouchableOpacity>
              )} */}
            </View>
          )}

          {index === 1 && (
            <View>
              {owners.length > 0 ? (
                owners.map((item, idx) => (
                  <View key={idx} style={styles.sellerCard}>
                    <View style={styles.sellerHeader}>
                      <Text style={styles.sellerTitle}>Seller #{idx + 1}</Text>
                      <Text style={styles.sellerPrice}>
                        ${item.askPrice}/MWh
                      </Text>
                    </View>
                    <View style={styles.sellerInfo}>
                      <View style={styles.sellerInfoRow}>
                        <Text style={styles.sellerLabel}>Quantity:</Text>
                        <Text style={styles.sellerValue}>
                          {formatQuantityMWh(Number(item.amount ?? 0))}
                        </Text>
                      </View>
                      <View style={styles.sellerInfoRow}>
                        <Text style={styles.sellerLabel}>Address:</Text>
                        <Text
                          style={styles.sellerAddress}
                          numberOfLines={1}
                          ellipsizeMode="middle">
                          {item.seller.id}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No sellers found</Text>
                  <Text style={styles.emptySubtext}>
                    This NFT is not currently listed for sale
                  </Text>
                </View>
              )}
            </View>
          )}

          {index === 2 && (
            <View>
              {activity && activity.length > 0 ? (
                activity.map((item, idx) => (
                  <View key={idx} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View style={styles.activityEventContainer}>
                        <Text style={styles.activityEvent}>
                          {item.marketEvent}
                        </Text>
                        <Text style={styles.activityDate}>
                          {new Date(
                            Number(item.timestamp) * 1000,
                          ).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={styles.activityPrice}>${item.price}</Text>
                    </View>

                    <View style={styles.activityDetails}>
                      <View style={styles.activityDetailRow}>
                        <Text style={styles.activityLabel}>From:</Text>
                        <Text
                          style={styles.activityValue}
                          numberOfLines={1}
                          ellipsizeMode="middle">
                          {item.seller || '-'}
                        </Text>
                      </View>
                      <View style={styles.activityDetailRow}>
                        <Text style={styles.activityLabel}>To:</Text>
                        <Text
                          style={styles.activityValue}
                          numberOfLines={1}
                          ellipsizeMode="middle">
                          {item.buyer || '-'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No activity yet</Text>
                  <Text style={styles.emptySubtext}>
                    Transaction history will appear here
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
  },
  headerContainer: {
    borderBottomWidth: 0,
    paddingBottom: 5,
    paddingTop: 5,
    elevation: 0,
    shadowOpacity: 0,
    height: 100,
  },
  backButton: {
    position: 'relative',
    marginRight: 10,
  },
  backIcon: {
    width: 20,
    height: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: '#2C2C2C',
    fontFamily: fontsFamily.MulishExtraBold,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  headerSection: {
    paddingTop: 8,
    paddingBottom: 20,
  },
  nftHeaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
  },
  nftImageCard: {
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  nftImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  nftSquareImage: {
    width: '100%',
    height: '100%',
  },
  nftPlaceholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 40,
    height: 40,
    opacity: 0.5,
  },
  nftInfoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  nftInfoHeader: {
    marginBottom: 8,
  },
  nftDetailsLabel: {
    fontSize: 14,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nftName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    marginBottom: 8,
    lineHeight: 26,
  },
  nftDescription: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.Mulish,
    marginBottom: 12,
    lineHeight: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
  },
  quantityValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 20,
    justifyContent: 'space-around',
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
  tabSection: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  tabContainer: {
    backgroundColor: 'transparent',
  },
  tabIndicator: {
    backgroundColor: 'transparent',
  },
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  detailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailTitle: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    marginRight: 16,
  },
  detailValue: {
    flex: 1.5,
    fontSize: 14,
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    fontWeight: '700',
    textAlign: 'right',
  },
  additionalImagesContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  additionalImagesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    marginBottom: 12,
  },
  additionalImagesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  additionalImageContainer: {
    alignItems: 'center',
  },
  additionalImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 8,
  },
  additionalImageLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    textAlign: 'center',
  },
  externalUrlContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8FFFE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0F0EF',
  },
  externalUrlText: {
    fontSize: 14,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
    marginBottom: 4,
  },
  externalUrl: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fontsFamily.Mulish,
  },
  sellerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sellerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sellerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
  },
  sellerPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#009D94',
    fontFamily: fontsFamily.MulishExtraBold,
  },
  sellerInfo: {
    gap: 8,
  },
  sellerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
  },
  sellerValue: {
    fontSize: 14,
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    fontWeight: '700',
  },
  sellerAddress: {
    fontSize: 12,
    color: '#111827',
    fontFamily: fontsFamily.Mulish,
    fontWeight: '500',
    maxWidth: 120,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  activityEventContainer: {
    flex: 1,
  },
  activityEvent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: fontsFamily.Mulish,
    fontWeight: '500',
  },
  activityPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#009D94',
    fontFamily: fontsFamily.MulishExtraBold,
  },
  activityDetails: {
    gap: 8,
  },
  activityDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    width: 60,
  },
  activityValue: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    fontFamily: fontsFamily.Mulish,
    fontWeight: '500',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: fontsFamily.Mulish,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default WalletNFTDetailsScreen;
