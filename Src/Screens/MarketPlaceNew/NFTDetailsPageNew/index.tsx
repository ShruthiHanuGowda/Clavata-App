import {
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {Header, Tab} from '@rneui/base';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import {DText} from '../../../Componants/DText';
import images from '../../../Theme/images';
import LinearGradient from 'react-native-linear-gradient';
import {fontsFamily} from '../../../Theme';
import {useState} from 'react';
import {formatQuantityMWh} from '../../../utils';
import {useCompleteNft} from '../../../hooks/useCompleteNft';
import {NftLocation} from '../../../types/types';
import SellModal from '../../../Componants/MarketPlace/BuySellModal/SellModal';

const width = Dimensions.get('window').width;

const ActionButton = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.actionContainer} onPress={onPress}>
    <View style={styles.actionIconWrapper}>
      <Image source={icon} style={styles.actionIcon} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const NFTHeader = ({name, quantity}) => (
  <View style={styles.nftHeaderContainer}>
    <ImageBackground
      source={images.rectangle}
      resizeMode="cover"
      imageStyle={{borderRadius: 7}}
      style={styles.nftImageBackground}>
      <Image source={images.rectangleDot} style={styles.nftOverlayImage} />
      <DText fontStyle="fontBold" style={styles.portfolio}>
        NFT Details
      </DText>
      <DText
        fontStyle="fontBold"
        style={styles.totalAmount}
        textProps={{numberOfLines: 1, ellipsizeMode: 'tail'}}>
        {name}
      </DText>
      <DText fontStyle="fontBold" style={styles.amount}>
        {quantity}
      </DText>
    </ImageBackground>
  </View>
);

const WalletNFTDetailsScreen = ({route}) => {
  const {nft} = route.params;
  console.log('🚀 ~ nft:', nft);

  const [index, setIndex] = useState(0);
  const [clickedSellNft, setClickedSellNft] = useState<any>({});
  const [isSellModalVisible, setIsSellModalVisible] = useState(false);
  const TAB_ITEMS = ['Details', 'Sellers', 'Activity'];

  const sellers = [
    {
      id: '0xa8b4856...1',
      amount: '15000000',
      askPrice: '2',
      timestamp: '1746808244',
      seller: {
        id: '0xfbf8f51692d205cdcbd45873235ab1284a2332d2',
      },
    },
    {
      id: '0xa8b4xyz...2',
      amount: '5000000',
      askPrice: '1.5',
      timestamp: '1746809250',
      seller: {
        id: '0xabc1234567890defabc1234567890defabc12345',
      },
    },
  ];

  const activityData = [
    {
      event: 'Sale',
      price: '2',
      from: '0xabc1234567890defabc1234567890defabc12345',
      to: '0xdef678901234abcddef678901234abcddef67890',
      timestamp: '1746786978',
    },
    {
      event: 'Transfer',
      price: '1.5',
      from: '0x456abc789def0123456abc789def0123456abc78',
      to: '0x789def456abc0123789def456abc0123789def45',
      timestamp: '1746790000',
    },
  ];

  const handleCollectibleClick = (location?: NftLocation) => {
    switch (location) {
      case NftLocation.WALLET:
        setClickedSellNft({nft, location, variant: 'sell'});
        setIsSellModalVisible(true);
        break;
      case NftLocation.FORSALE:
        setClickedSellNft({nft, location, variant: 'adjust'});
        setIsSellModalVisible(true);
        break;
      default:
        break;
    }
  };

  // const {
  //   nft: combinedNft,
  //   loading: isLoading,
  //   refetch,
  // } = useCompleteNft(nft.id);

  // console.log('combinedNft', combinedNft);

  // const hasTokenData = combinedNft?.tokenId && combinedNft?.collectionAddress;

  // if (isLoading || !combinedNft) {
  //   return (
  //     <View style={styles.loadingContainer}>
  //       <ActivityIndicator size="large" color="#81c8c3" />
  //       <Text style={styles.loadingText}>Fetching NFT Details...</Text>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={{borderBottomWidth: 0}}
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
        <View style={{marginTop: 5}}>
          <LinearGradient
            colors={['#FFFFFF', '#dcf2f1', '#FFFFFF']}
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            useAngle={true}
            angle={330}
            locations={[0, 0, 0.25]}>
            <View style={{paddingTop: 10, paddingBottom: 30}}>
              <NFTHeader
                name={nft?.name}
                quantity={formatQuantityMWh(
                  Number(nft.marketData?.quantity ?? 0),
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
                  onPress={() => handleCollectibleClick(nft.location)}
                />
                <ActionButton
                  icon={images.buyIcon}
                  label="Offset"
                  onPress={() => {}}
                />
              </View>
            </View>
          </LinearGradient>
          <Tab
            value={index}
            onChange={setIndex}
            variant="primary"
            indicatorStyle={{backgroundColor: 'transparent'}}
            style={{backgroundColor: 'transparent'}}>
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
        <View style={{marginHorizontal: 25, marginTop: 20}}>
          {index === 0 && (
            <View style={styles.detailsContainer}>
              {[
                ['Collection Name', `${nft?.name}`],
                ['Symbol', 'IS2025'],
                ['Year', '2025'],
                ['Country', 'India'],
                [
                  'Contract Address',
                  '0xb18c23b04e82ce8ba14597966e25f63343e346b7',
                ],
                ['Owner Address', '0x756Ba4Bd0eFEd10c5F5C3C76f15893d0bB2387A4'],
                ['Type', 'Solar'],
                ['Token ID', '1'],
                [
                  'Metadata URL',
                  'https://nfts-data.s3.me-central-1.amazonaws.com/BH2024/1.json',
                ],
                ['Trade Volume (USDC)', '100'],
                ['Latest Traded Price (USDC)', '10'],
                ['Total Trades', '1'],
                ['Total Listed', `${nft?.totalListed ?? 0}`],
                ['Tradable', 'Yes'],
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
              {sellers.map((item, idx) => (
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
              ))}
            </>
          )}
          {index === 2 && (
            <View>
              {activityData.map((item, idx) => (
                <View key={idx} style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <Text style={styles.activityEvent}>{item.event}</Text>
                    <Text style={styles.activityPrice}>${item.price} USDC</Text>
                  </View>

                  <View style={styles.activityDetailRow}>
                    <Text style={styles.activityLabel}>From</Text>
                    <Text
                      style={styles.activityValue}
                      numberOfLines={1}
                      ellipsizeMode="middle">
                      {item.from}
                    </Text>
                  </View>

                  <View style={styles.activityDetailRow}>
                    <Text style={styles.activityLabel}>To</Text>
                    <Text
                      style={styles.activityValue}
                      numberOfLines={1}
                      ellipsizeMode="middle">
                      {item.to}
                    </Text>
                  </View>

                  <View style={styles.activityDetailRow}>
                    <Text style={styles.activityLabel}>Date</Text>
                    <Text style={styles.activityValue}>
                      {new Date(Number(item.timestamp) * 1000).toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
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
        }}
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
    backgroundColor: '#F5F5F5',
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
    shadowOffset: {width: 0, height: 1},
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
});

export default WalletNFTDetailsScreen;
