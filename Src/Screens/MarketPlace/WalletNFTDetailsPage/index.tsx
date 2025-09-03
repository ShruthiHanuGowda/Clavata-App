import {
  Image,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import {Header, Tab} from '@rneui/base';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
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
import {SnackBarMessage} from '../../../utils/snackBar';
import {useKycCheck} from '../../../CustomHooks/GlobalKycProvider';
import {RefreshControl} from 'react-native-gesture-handler';
import LoaderAnimation from '../../../Componants/Loading/LoaderAnimation';
import {useNft} from '../../../../screens/Provider/NftProvider';

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
  metadata?: NFTMetadata | null;
}

const NFTHeader = ({name, quantity, metadata}: NFTHeaderProps) => (
  <View style={styles.nftHeaderContainer}>
    {/* NFT Image Card */}
    <View style={styles.nftImageCard}>
      <View style={styles.nftImageContainer}>
        {metadata?.image ? (
          <Image
            source={{uri: metadata?.image || NFT_DEFAULT_IMAGE_URL}}
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

  // Helper functions for dynamic tab styles
  const getTabContainerStyle = (active: boolean) => [
    styles.tabItemContainer,
    active ? styles.tabItemActive : styles.tabItemInactive,
  ];

  const getTabTitleStyle = (active: boolean) => [
    styles.tabTitleBase,
    active ? styles.tabTitleActive : styles.tabTitleInactive,
  ];
  const navigation = useNavigation();
  const {magic, setActiveNetwork} = useMagic();

  const [index, setIndex] = useState(0);
  const [currentQuantity, setCurrentQuantity] = useState(
    nft?.marketData?.quantity,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [nftMetadata, setNftMetadata] = useState<NFTMetadata | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const {checkKYC, isKycCompleted} = useKycCheck();

  const fetchNftMetadata = async () => {
    try {
      setMetadataLoading(true);
      const network = setActiveNetwork('denergy');

      if (!nft?.collectionAddress || !nft?.tokenId) {
        console.error('Missing collection address or token ID in NFT data.');
        return;
      }

      const magicProvider = new BrowserProvider(network.rpcProvider as any);
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

        const magicProvider = new BrowserProvider(magic.rpcProvider as any);
        const signer = await magicProvider.getSigner();

        const collectionContract = new Contract(
          nft.collectionAddress,
          ERC1155_ABI,
          signer,
        );

        const balance = await collectionContract.balanceOf(
          signer.address,
          nft?.tokenId,
        );
        console.log(balance);

        setCurrentQuantity(balance);
      } catch (error) {
        console.error('Error fetching current quantity:', error);
      }
    };

    fetchCurrentQuantity();
    fetchNftMetadata();
  }, []);

  const {refresh: refreshNfts} = useNft();

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
        onError: () => {
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
        // Alert.alert('NFT Sent');
        refetch();
        refreshNfts();
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

  const {activity, refetch: refetchActivity} = useNftActivity(
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
    if (!nftMetadata?.attributes) {
      return '-';
    }
    const attribute = nftMetadata.attributes.find(
      attr => attr?.trait_type === traitType,
    );
    return attribute ? String(attribute.value) : '-';
  };

  const openURL = async (url: string) => {
    if (url && url !== '-') {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Cannot open this URL');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open URL');
      }
    }
  };

  if (isLoading || isCollectionLoading) {
    return (
      <View style={styles.screenContainer}>
        <Header
          backgroundColor={'#FFF'}
          containerStyle={styles.loadingHeaderContainer}
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
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <LoaderAnimation size={'large'} />
            <Text style={styles.loadingText}>Fetching NFT Details...</Text>
            <Text style={styles.loadingSubtext}>
              Please wait while we load your certificate
            </Text>
          </View>
        </View>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    refetch();
    refetchActivity();
    fetchNftMetadata();
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
            <ActionButton
              icon={images.history}
              label="History"
              onPress={() => {
                console.log('🚀 ~ NFTDetailHistory ~ nftName: NFT', nft);
                navigation.navigate('NFTDetailHistory', {
                  collectionAddress: nft?.collectionAddress,
                  nftName: nft?.name,
                  nftId: nft?.tokenId,
                });
              }}
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
                containerStyle={active => getTabContainerStyle(active)}
                title={tab}
                titleStyle={active => getTabTitleStyle(active)}
              />
            ))}
          </Tab>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {index === 0 && (
            <View>
              {/* Certificate Details Section */}
              <View style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>📜</Text>
                  </View>
                  <Text style={styles.categoryTitle}>Certificate Details</Text>
                </View>
                <View style={styles.categoryContent}>
                  {[
                    ['Energy Type', getAttributeValue('Energy Type')],
                    ['Country', getAttributeValue('Country')],
                    ['Year', getAttributeValue('Year')],
                    ['Registry', getAttributeValue('Registry')],
                    ['Standard', getAttributeValue('Standard')],
                    [
                      'Production Start Date',
                      getAttributeValue('Production Start Date'),
                    ],
                    [
                      'Production End Date',
                      getAttributeValue('Production End Date'),
                    ],
                  ].map(([title, value], idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.detailRow,
                        idx === 6 && styles.lastDetailRow,
                      ]}>
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
                </View>
              </View>

              {/* Device Details Section */}
              <View style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>⚡</Text>
                  </View>
                  <Text style={styles.categoryTitle}>Device Details</Text>
                </View>
                <View style={styles.categoryContent}>
                  {[
                    ['Facility Name', getAttributeValue('Facility Name')],
                    [
                      'Facility Commissioning Date',
                      getAttributeValue('Facility Commissioning Date'),
                    ],
                    ['Fuel Code', getAttributeValue('Fuel code')],
                    ['Coordinates', getAttributeValue('cordinates')],
                  ].map(([title, value], idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.detailRow,
                        idx === 3 && styles.lastDetailRow,
                      ]}>
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
                </View>
              </View>

              {/* NFT Details Section */}
              <View style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconContainer}>
                    <Text style={styles.categoryIcon}>🔗</Text>
                  </View>
                  <Text style={styles.categoryTitle}>NFT Details</Text>
                </View>
                <View style={styles.categoryContent}>
                  {[
                    ['Symbol', `${data?.collectionDetails?.symbol || '-'}`],
                    ['Token ID', `${data?.tokenId || '-'}`],
                    [
                      'Contract Address',
                      `${data?.collectionDetails?.contractAddress || '-'}`,
                    ],
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

                  {/* Special handling for Metadata URL with link */}
                  <View style={styles.lastDetailRow}>
                    <Text style={styles.detailTitle} numberOfLines={1}>
                      Metadata URL
                    </Text>
                    {combinedNft?.marketData?.metadataUrl &&
                    combinedNft?.marketData?.metadataUrl !== '-' ? (
                      <TouchableOpacity
                        style={styles.linkContainer}
                        onPress={() =>
                          openURL(combinedNft?.marketData?.metadataUrl ?? '')
                        }
                        activeOpacity={0.7}>
                        <Text
                          style={styles.linkText}
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          View Metadata
                        </Text>
                        <Text style={styles.linkIcon}>🔗</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text
                        style={styles.detailValue}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        -
                      </Text>
                    )}
                  </View>
                </View>
              </View>
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
                          {formatQuantityMWh(Number(item.amount ?? 0), true)}
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

      {/* Metadata Loading Overlay */}
      {metadataLoading && (
        <View style={styles.metadataLoadingOverlay}>
          <View style={styles.metadataLoadingContent}>
            <LoaderAnimation size={'medium'} />
            <Text style={styles.metadataLoadingText}>
              Loading Certificate Details...
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: fontsFamily.MulishBold,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.Mulish,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingHeaderContainer: {
    borderBottomWidth: 0,
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
    padding: 8,
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

  // Updated Category Card Styles
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FFFE',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  categoryIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#009D94',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#009D94',
    fontFamily: fontsFamily.MulishExtraBold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    minHeight: 44,
  },
  lastDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0,
    minHeight: 44,
  },
  detailTitle: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    marginRight: 12,
  },
  detailValue: {
    flex: 1.2,
    fontSize: 14,
    color: '#111827',
    fontFamily: fontsFamily.MulishExtraBold,
    fontWeight: '700',
    textAlign: 'right',
  },
  linkContainer: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F8F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#B8E6E3',
    marginLeft: 8,
  },
  linkText: {
    fontSize: 13,
    color: '#009D94',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
    marginRight: 4,
  },
  linkIcon: {
    fontSize: 12,
    color: '#009D94',
  },

  // Seller Card Styles
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

  // Activity Card Styles
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

  // Empty State Styles
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

  // Tab Item Styles
  tabItemContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 1,
  },
  tabItemActive: {
    borderBottomColor: '#009D94',
    borderBottomWidth: 3,
  },
  tabItemInactive: {
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  tabTitleBase: {
    fontSize: 16,
  },
  tabTitleActive: {
    color: '#009D94',
    fontFamily: fontsFamily.MulishExtraBold,
    fontWeight: '800',
  },
  tabTitleInactive: {
    color: '#6B7280',
    fontFamily: fontsFamily.MulishBold,
    fontWeight: '600',
  },

  // Metadata Loading Overlay Styles
  metadataLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  metadataLoadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  metadataLoadingText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontFamily: fontsFamily.MulishBold,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default WalletNFTDetailsScreen;
