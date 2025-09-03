import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import style from './styles';
import {Header} from '@rneui/base';
import {navigateBack} from '../../../Navigation/NavigationFunctions';
import images from '../../../Theme/images';
import CustomImageButton from '../../../Componants/rc_imageButton';
import {DText} from '../../../Componants/DText';
import {fontsFamily} from '../../../Theme';

interface RouteParams {
  fromScreen?: string;
}

interface AccountBeneficiaryProps {
  route?: {
    params?: RouteParams;
  };
}

const AccountBeneficiary: React.FC<AccountBeneficiaryProps> = () => {
  const handleBackPress = (): void => {
    navigateBack();
  };

  return (
    <View style={localStyles.container}>
      <Header
        backgroundColor={'#FFF'}
        containerStyle={localStyles.headerContainer}
        leftComponent={
          <TouchableOpacity
            onPress={handleBackPress}
            style={localStyles.backContainer}>
            <Image source={images.back} />
          </TouchableOpacity>
        }
        centerComponent={
          <View style={localStyles.nameContainer}>
            <DText style={localStyles.title} fontStyle="fontBold">
              Beneficiaries
            </DText>
          </View>
        }
      />

      <View style={localStyles.contentContainer}>
        <View style={localStyles.textContainer}>
          <Text style={localStyles.subText}>
            It is a long established fact that a reader will be distracted by
            the readable content of a page
          </Text>
        </View>
      </View>

      <View style={localStyles.btnAlign}>
        <CustomImageButton
          backgroundImage={images.buttonBg}
          label="Add a Beneficiary"
          labelStyle={style.textStyle}
          onPress={() => {}}
          containerWrapper={localStyles.buttonWrapper}
          bgImg={localStyles.buttonImage}
        />
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  headerContainer: {
    borderBottomWidth: 0,
  },
  backContainer: {
    position: 'relative',
  },
  title: {
    fontSize: 18,
    color: '#2C2C2C',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  contentContainer: {
    flex: 1,
  },
  textContainer: {
    marginHorizontal: 20,
    marginTop: 38,
  },
  subText: {
    color: '#747474',
    fontSize: 14,
    fontFamily: fontsFamily.MulishSemiBold,
    lineHeight: 22.4,
  },
  listItemContainer: {
    marginHorizontal: 20,
    marginVertical: 5,
  },
  listItemContent: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTouchable: {
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    borderWidth: 1,
    borderRadius: 30,
    width: 60,
    height: 60,
    borderColor: '#fff',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemDetailsContainer: {
    marginHorizontal: 10,
    width: '80%',
  },
  name: {
    fontFamily: fontsFamily.MulishBold,
    fontSize: 15,
    color: '#000',
  },
  address: {
    fontSize: 12,
    color: '#AAAAAA',
    fontFamily: fontsFamily.Mulish,
  },
  closeIcon: {
    height: 28,
    width: 28,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData: {
    color: 'grey',
    fontFamily: fontsFamily.Mulish,
    fontSize: 13,
  },
  btnAlign: {
    justifyContent: 'flex-end',
    flex: 0,
  },
  buttonWrapper: {
    height: 51,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 18,
  },
  buttonImage: {
    height: 51,
    width: '100%',
  },
});

export default AccountBeneficiary;
